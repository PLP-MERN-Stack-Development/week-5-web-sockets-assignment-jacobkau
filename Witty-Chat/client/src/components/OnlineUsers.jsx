import { useSocket } from '../socket/socket';

export default function OnlineUsers() {
  const { users } = useSocket();

  return (
    <div className="p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Online Users</h3>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">{user.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}