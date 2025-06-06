type CustomSelectOptionProps = {
  name: string;
  isSelected: boolean;
  onClick: () => void;
};

export default function CustomSelectOption({
  name,
  isSelected,
  onClick,
}: CustomSelectOptionProps) {
  return (
    <p
      className={`w-full px-4 h-12 flex items-center hover:bg-gray-200/25 ${
        isSelected ? "bg-gray-200/50" : ""
      } `}
      onClick={onClick}
    >
      {name}
    </p>
  );
}
