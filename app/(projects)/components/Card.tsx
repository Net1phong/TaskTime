import { DraggableProvided } from "@hello-pangea/dnd";
import Image from "next/image";

interface User {
  id: string;
  username: string;
  avatar_url: string;
  email: string;
}

interface CardProps {
  card_id: number;
  card_name: string;
  provided: DraggableProvided;
  openModal: (cardId: number) => void;
  member: User[];
}

function Card({
  card_id,
  card_name,
  openModal,
  provided,
  member = [],
}: CardProps) {
  return (
    <div
      className="relative"
      {...provided.dragHandleProps}
      {...provided.draggableProps}
      ref={provided.innerRef}
    >
      <div className="absolute top-3 right-3">
        <details className="dropdown dropdown-end">
          <summary className="btn btn-ghost btn-circle text-black">
            <i className="fa-solid fa-ellipsis fa-xl"></i>
          </summary>
          <ul className="dropdown-content menu bg-black/50 backdrop-blur-sm rounded-box z-10 text-white font-bold text-lg w-60 p-2 shadow">
            <li>
              <a className="justify-between">
                Rename
                <i className="fa-solid fa-pen"></i>
              </a>
            </li>
            <li>
              <a onClick={() => openModal(card_id)} className="justify-between">
                Open Card
                <i className="fa-solid fa-folder"></i>
              </a>
            </li>
            <li>
              <a className="justify-between">
                Move to
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            </li>
            <li>
              <a className="justify-between hover:bg-error/80">
                Delete Card
                <i className="fa-solid fa-trash-can"></i>
              </a>
            </li>
          </ul>
        </details>
      </div>
      <div
        onClick={() => openModal(card_id)}
        className="flex flex-col justify-between gap-3 bg-white p-5 rounded-xl text-black "
      >
        {/* Title */}
        <h2 className="text-xl font-bold w-11/12 line-clamp-1">{card_name}</h2>
        {/* member */}
        {Array.isArray(member) && member.length > 0 && (
          <div className="avatar-group -space-x-4 rtl:space-x-reverse">
            {member.slice(0, 3).map((user, index) => (
              <div key={index} className="avatar">
                <Image
                  className="rounded-full"
                  width={28}
                  height={28}
                  src={user.avatar_url}
                  alt={user.username}
                />
              </div>
            ))}
            {member.length - 3 > 0 && (
              <div className="avatar placeholder">
                <div className="bg-black/65 text-white font-bold w-8">
                  <span>+{member.length - 3}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
