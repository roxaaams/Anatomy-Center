export { default as Service } from "./service";
export { hookApi as installAPI } from "./decorator";
export { hookApiRequests as installAPIEndpoints } from "./decorator";

import Service from "./service";
export const ServiceInstance = Service.instance;
