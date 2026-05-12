import { Router, type IRouter } from "express";
import healthRouter from "./health";
import auraSphereRouter from "./aura-sphere";

const router: IRouter = Router();

router.use(healthRouter);
router.use(auraSphereRouter);

export default router;
