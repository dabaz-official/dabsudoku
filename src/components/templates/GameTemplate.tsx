type GameTemplateProps = {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  board?: React.ReactNode;
  controls?: React.ReactNode;
};

export default function GameTemplate({ header, sidebar, board, controls }: GameTemplateProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 p-4">
      {header}
      <div className="flex flex-col gap-6">
        {board}
        {controls}
      </div>
      <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
        {sidebar}
      </aside>
    </div>
  );
}