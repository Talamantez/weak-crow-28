// Define types
export type BlockType = "paragraph" | "header" | "unordered-list-item";
export interface Block {
  type: BlockType;
  text: string;
}
export interface RichText {
  blocks: Block[];
}
export interface Section {
  title: string;
  description?: RichText;
  content?: RichText;
  sections?: Section[];
}
export interface Chapter {
  title: string;
  description: RichText;
  sections: Section[];
}
export interface Data {
  Chapters: Chapter[];
}
