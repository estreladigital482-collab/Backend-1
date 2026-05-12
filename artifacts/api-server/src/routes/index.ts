import { Router, type IRouter } from "express";
import healthRouter from "./health";
import auraSphereRouter from "./aura-sphere";
import chatRouter from "./chat";
import stubV1Router from "./stub-v1";

const router: IRouter = Router();

router.use(healthRouter);
router.use(auraSphereRouter);
router.use(chatRouter);
router.use(stubV1Router);

export default router;
