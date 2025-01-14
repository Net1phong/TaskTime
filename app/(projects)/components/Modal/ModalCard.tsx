import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import EditCard from "./EditCard";

interface ModalCardProps {
  close: () => void;
  cardId: number;
  board_id: string;
}

interface Comment {
  comment_id: number;
  comment_text: string;
  comment_date: string;
  users: User;
}

interface User {
  id: string;
  username: string;
  avatar_url: string;
  email: string;
}

interface CardData {
  card_id: number;
  card_name: string;
  position_card: number;
  description: string;
  startDate: string;
  endDate: string;
  lists: {
    list_name: string;
  }[];
  users: User[];
  comments: Comment[];
}

const ModalCard: FC<ModalCardProps> = ({ close, cardId, board_id }) => {
  const supabase = createClient();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true); // Start loading as true

  // Function to fetch card data
  const fetchCardData = async () => {
    const { data, error } = await supabase
      .from("cards")
      .select(
        ` 
        card_id, card_name, position_card, description, startDate, endDate,
        lists!cards_list_id_fkey(list_name),
        users!cardmember(id, username, avatar_url, email),
        comments!comments_card_id_fkey(
          comment_id, comment_text, comment_date, 
          users!comments_user_id_fkey1(
            id, username, email, avatar_url
          )
        )
        `
      )
      .eq("card_id", cardId)
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching card data: ", error);
    } else {
      setCardData(data);
    }
    setLoading(false); // Set loading to false after fetching data
  };

  useEffect(() => {
    fetchCardData();

    // Create a channel for real-time updates on the 'cards' table
    const channel = supabase
      .channel("public:cards")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events
          schema: "public",
          table: "cards",
        },
        (payload) => {
          if (payload.new.card_id === cardId) {
            console.log("Card updated:", payload);
            setCardData(payload.new); // Update card data with new data
          } else if (payload.old.card_id === cardId) {
            console.log("Card deleted");
            setCardData(null); // Clear card data on delete
            close(); // Close the modal if the card is deleted
          }
        }
      )
      .subscribe();

    // Cleanup function to unsubscribe from the channel
    return () => {
      supabase.removeChannel(channel); // Use the correct method for unsubscription
    };
  }, [cardId]);

  return (
    <dialog className="modal modal-open">
      {loading ? (
        <div className="modal-box max-w-[50rem] min-h-[35rem] py-8 bg-[#FCFCF7] skeleton rounded-box"></div>
      ) : (
        <div className="modal-box max-w-[50rem] min-h-[35rem] py-8 bg-[#FCFCF7]">
          <button
            onClick={close}
            className="btn btn-md btn-circle btn-ghost text-black hover:text-white hover:bg-primary/50 hover:rotate-90 transition-all duration-200 absolute right-5 top-5"
          >
            <i className="fa-solid fa-xmark fa-xl"></i>
          </button>
          <div className="px-4 text-black">
            <h2 className="text-2xl font-extrabold">{cardData?.card_name}</h2>
            <p className="text-gray-400 font-bold">
              In {cardData?.lists.list_name}
            </p>

            <div className="flex items-center gap-x-3 pb-5 pt-2 text-xl font-extrabold">
              <h3>Member</h3>
              {cardData?.users.map((user) => (
                <div key={user.id} className="avatar">
                  <Image
                    className="rounded-full"
                    width={32}
                    height={32}
                    src={user.avatar_url}
                    alt={user.username}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {cardData && <EditCard cardData={cardData} board_id={board_id} />}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
};

export default ModalCard;
