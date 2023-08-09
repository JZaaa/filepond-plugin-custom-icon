// @ts-ignore
import { FilePondOptions } from "filepond";

declare module "filepond" {
    export interface FilePondOptions {
        customIconList?: {class:string, title?:string, id?:string},
    }
}
