
interface ChatHeaderProps {
  title: string;
}

export const ChatHeader = ({ title }: ChatHeaderProps) => {
  return (
    <div className="flex-shrink-0">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
};
