import { FlatfileEvent } from "@flatfile/listener";
import { getUserIdFromSpace } from "./flatfile-api";
import { get, post } from "./request";

type DepartmentResult = {
  id: string;
  departmentName: string;
  departmentCode: string;
};

export class HcmShowApiService {
  static syncSpace = async (
    event: FlatfileEvent,
    // Temporary solution until react package can open the same space that is saved in HCM.
    workflowType?: string
  ) => {
    console.log("syncSpace in HCM.show | e: " + JSON.stringify(event));

    // Extracting the spaceId from the event context
    const { spaceId } = event.context;

    // Getting the userId from the space using the getUserIdFromSpace utility function
    const userId = await getUserIdFromSpace(spaceId);

    // Making a POST request to 'hcm.show' API to sync the space
    return await post({
      apiBaseUrl: await this.getApiBaseUrl(event),
      path: `/api/v1/sync-space`,
      body: { userId, spaceId, workflowType },
      headers: await this.headers(event),
    });
  };

  static syncFilefeed = async (event: FlatfileEvent) => {
    console.log("Syncing filefeed in HCM.show.");

    const { spaceId } = event.context;
    const topic = event.payload.job || event.topic;

    if (!topic) {
      return;
    }

    return await post({
      apiBaseUrl: await this.getApiBaseUrl(event),
      path: "/api/v1/sync-file-feed",
      body: { spaceId, topic },
      headers: await this.headers(event),
    });
  };

  static fetchDepartments = async (
    event: FlatfileEvent
  ): Promise<DepartmentResult[]> => {
    console.log("Fetching departments from HCM.show");

    let result;
    try {
      result = await get({
        apiBaseUrl: await this.getApiBaseUrl(event),
        path: "/api/v1/departments",
        params: {},
        headers: await this.headers(event),
      });
    } catch (error) {
      result = [];
    }

    const departments = result as DepartmentResult[];

    console.log("Departments found: " + JSON.stringify(departments));

    return departments;
  };

  static fetchEmployees = async (event: FlatfileEvent) => {
    // Logging the event for debugging purposes
    console.log("fetchEmployees | e: " + JSON.stringify(event));

    // Extracting the spaceId from the event context
    const { spaceId } = event.context;

    // Getting the userId from the space using the getUserIdFromSpace utility function
    const userId = await getUserIdFromSpace(spaceId);

    // Making a GET request to 'hcm.show' API to get a list of employees for the input user
    return await get({
      apiBaseUrl: await this.getApiBaseUrl(event),
      path: `/api/v1/list-employees`,
      params: { userId },
      headers: await this.headers(event),
    });
  };

  private static headers = async (event: FlatfileEvent) => {
    const serverAuthToken = await this.getServerAuthToken(event);

    return {
      "Content-Type": "application/json",
      "x-server-auth": serverAuthToken,
    };
  };

  private static getServerAuthToken = async (event: FlatfileEvent) => {
    let serverAuthToken;

    try {
      serverAuthToken = await event.secrets("SERVER_AUTH_TOKEN");
    } catch (e) {
      const message = "FAILED FETCH SERVER AUTH TOKEN";
      console.error(message);
      throw new Error(message);
    }

    return serverAuthToken;
  };

  // TODO: Until we can 'bake' env vars into the listener deployment, in prod use secrets.
  private static getApiBaseUrl = async (event: FlatfileEvent) => {
    let apiBaseUrl;

    try {
      // Prod, try secrets
      apiBaseUrl = await event.secrets("API_BASE_URL");
    } catch (e) {
      const message = "No API_BASE_URL secret";
      console.warn(message);
    }

    if (apiBaseUrl) {
      return apiBaseUrl;
    }

    // Dev
    return "http://localhost:3000";
  };
}
