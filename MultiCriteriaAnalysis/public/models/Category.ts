module Models {
    export interface ICategory {
        title: string;
        weight: number;
        criterias: Array<ICriteria>;
    }
    
    export class Category implements ICategory {
        public title: string;
        public weight: number;
        public criterias: Array<ICriteria> = [];
        
    }
}