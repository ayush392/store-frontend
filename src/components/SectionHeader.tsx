type Props = {
  title: string;
};

// Card section title. The list filters that used to sit here did nothing, so
// they were removed until filtering is built.
export const SectionHeader = ({ title }: Props) => {
  return (
    <div className="border-b border-line px-4 py-3.5">
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
    </div>
  );
};
