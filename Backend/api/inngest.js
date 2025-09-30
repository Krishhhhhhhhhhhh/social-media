import {serve} from "inngest/express";
import { inngest,functions} from "../inngest/index.js";
export default serve(inngest, functions);