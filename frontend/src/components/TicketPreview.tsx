type ticketProps = {
    blockNumber: string;
    blockHash: string;
    gasPrice: number;
    metadataURI: string;
}

type TicketPreviewProps = {
    ticketBought: ticketProps | null;
};

const TicketPreview = ({ ticketBought }: TicketPreviewProps) => {
    if(!ticketBought) return null;

  return (
    
    <div className="min-h-[80vh] p-6 space-y-8 bg-gradient-to-br from-blue-900/50 to-blue-950/50 border border-blue-800/30 rounded-xl">
        <div>{JSON.stringify(ticketBought)}</div>
    </div>
  )
}

export default TicketPreview