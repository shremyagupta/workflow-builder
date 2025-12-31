declare module 'react-icons/fa' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface IconBaseProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    title?: string;
  }
  
  export type IconType = ComponentType<IconBaseProps>;
  
  // Node component icons
  export const FaPlus: IconType;
  export const FaTrash: IconType;
  export const FaCodeBranch: IconType;
  export const FaCheck: IconType;
  export const FaTimes: IconType;
  
  // App component icons
  export const FaArrowLeft: IconType;
  export const FaSave: IconType;
  export const FaThLarge: IconType;
  export const FaAdjust: IconType;
  
  // Sidebar component icons
  export const FaPlay: IconType;
  export const FaList: IconType;
  export const FaTags: IconType;
  export const FaComment: IconType;
  export const FaStop: IconType;
  export const FaBars: IconType;
  
  // WorkflowCanvas component icons
  export const FaMinusCircle: IconType;
  export const FaExpandArrowsAlt: IconType;
}

