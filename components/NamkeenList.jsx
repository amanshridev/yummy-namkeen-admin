import React from "react";
import { MdDeleteForever } from "react-icons/md";


const NamkeenList = ({ item, deleteNamkeen }) => {
  const handleDelete = () => {
    deleteNamkeen(item.id);
  };

  return (
    <tr key={item.id} className="hover:bg-gray-100">
      <td className="border p-2">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.itemName}
            className="w-12 h-12 object-cover rounded-full"
            width={40}
            height={40}
          />
        )}
      </td>
      <td className="border p-2">{item.itemName}</td>
      <td className="border p-2">{item.description}</td>
      <td className="border p-2">{item.price}</td>
      <td className="border p-2">{item.quantity}</td>
      <td className="border p-2">
        <button className="text-red-500 hover:text-red-700 w-4 h-4" onClick={handleDelete}>
          <MdDeleteForever size={20} />
        </button>
      </td>
    </tr>
  );
};

export default NamkeenList;
