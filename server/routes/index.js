import ExampleRouter from "./example.router";
import AuthRouter from "./auth.router";
import RoomRouter from "./room.router";
import RenameRouter from './rename.router'

const AppRoutes = (app) => {
  app.use(ExampleRouter.routerPrefix, ExampleRouter.route());
  app.use(AuthRouter.routerPrefix, AuthRouter.route());
  app.use(RoomRouter.routerPrefix, RoomRouter.route());
  app.use(RenameRouter.routerPrefix, RenameRouter.route());
};

export default AppRoutes;
