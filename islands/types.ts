// types.ts

export type Block = {
    type: string;
    text: string;
  };
  
  export type Content = {
    blocks: Block[];
  };
  
  export type Section = {
    title: string;
    description?: Content;
    content?: Content;
    sections?: Section[];
  };
  
  export type Chapter = {
    id: string;
    title: string;
    imageUrl?: string;
    description?: Content;
    sections: Section[];
  };
  
  export type ResourceRoadmap = {
    chapters: Chapter[];
  };