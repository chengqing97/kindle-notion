export interface ParsedClippingObj {
  book: string;
  author: string;
  content: string;
  type: string;
  page: string;
  location: string;
  oriDate: string;
  date: any;
}

export interface Options {
  import_all?: boolean;
  key?: string;
  database_id?: string;
  selected_db?: { database_id: string; key: string };
  clipping_path?: string;
}
