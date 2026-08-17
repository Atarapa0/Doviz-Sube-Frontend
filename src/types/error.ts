export type ApiHataResponse = {
  status: number;
  hataKodu: string;
  mesaj: string;
  hataId?: string;
  correlationId?: string;
  timestamp?: string;
};

