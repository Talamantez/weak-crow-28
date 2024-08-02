// types.ts
export type BlockType = "paragraph" | "header" | "unordered-list-item";
export interface Block {
  type: string;
  text: string;
  id?: string;
}

export interface RichText {
  blocks: Block[];
}

export type Content = {
  blocks: Block[];
};

export interface Section {
  title: string;
  description?: {
    blocks: Block[];
  };
  sections?: Section[];
}

export interface Chapter {
  index: string;
  title: string;
  description: {
    blocks: Block[]
  };
  imageUrl?: string;
  isIncluded: boolean;
  sections: Section[];
}

export type ResourceRoadmap = {
  chapters: Chapter[];
};

export interface RoadmapVersion {
  id: string;
  name: string;
  date: string;
  chapters: Chapter[];
}

