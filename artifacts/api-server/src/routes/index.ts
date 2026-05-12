import { Router, type IRouter } from "express";
import healthRouter from "./health";
import auraSphereRouter from "./aura-sphere";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(auraSphereRouter);
router.use(chatRouter);

export default router;
