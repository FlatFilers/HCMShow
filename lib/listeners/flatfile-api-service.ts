import api from "@flatfile/api";
import { SheetConfig } from "@flatfile/api/api";

export class FlatfileApiService {
  static async setupSpace({
    name,
    spaceId,
    environmentId,
    blueprint,
    theme,
  }: {
    name: string;
    spaceId: string;
    environmentId: string;
    blueprint: SheetConfig[];
    theme: any;
  }) {
    // Create a new workbook using the Flatfile API
    let workbookId;
    try {
      workbookId = await FlatfileApiService.createWorkbook({
        name,
        spaceId,
        environmentId,
        blueprint,
      });

      console.log("Created Workbook with ID:" + workbookId);
    } catch (error) {
      console.error("Error creating workbook:", JSON.stringify(error, null, 2));
      throw new Error(`Error creating workbook for spaceId ${spaceId}`);
    }

    // Currently updating a space overwrites instead of merging, so query and re-set userId.
    let userId;
    try {
      userId = await FlatfileApiService.getUserIdFromSpace({
        spaceId,
      });
    } catch (error) {
      console.error(
        `Error getting userId for spaceId ${spaceId}: ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
      throw new Error(`Error getting userId for spaceId ${spaceId}`);
    }

    // Update the space to set the primary workbook and theme
    try {
      await FlatfileApiService.configureSpace({
        spaceId,
        environmentId,
        workbookId,
        userId,
        theme,
      });

      console.log("Updated Space with ID: " + spaceId);
    } catch (error) {
      console.error(
        `Error configuring space for spaceId ${spaceId}: ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
      throw new Error(`Error configuring space for spaceId ${spaceId}`);
    }
  }

  private static async getUserIdFromSpace({
    spaceId,
  }: {
    spaceId: string;
  }): Promise<string> {
    const space = await api.spaces.get(spaceId);

    // console.log('Space: ' + JSON.stringify(space));

    const userId = space.data.metadata.userId;

    if (!userId) {
      throw new Error(
        `No userId found in space metadata for spaceId ${spaceId}`
      );
    }

    return userId;
  }

  private static async createWorkbook({
    name,
    spaceId,
    environmentId,
    blueprint,
  }: {
    name: string;
    spaceId: string;
    environmentId: string;
    blueprint: SheetConfig[];
  }) {
    // Create a new workbook using the Flatfile API
    const workbook = await api.workbooks.create({
      name,
      spaceId: spaceId,
      environmentId: environmentId,
      labels: ["primary"],
      sheets: blueprint,
      actions: [
        {
          operation: "submitAction",
          mode: "foreground",
          label: "Submit",
          type: "string",
          description: "Submit Data to HCM Show",
          primary: true,
        },
      ],
    });

    if (!workbook.data.id) {
      throw new Error(`Error creating workbook for spaceId ${spaceId}`);
    }

    return workbook.data.id;
  }

  private static async configureSpace({
    spaceId,
    environmentId,
    workbookId,
    userId,
    theme,
  }: {
    spaceId: string;
    environmentId: string;
    workbookId: string;
    userId: string;
    theme: any;
  }) {
    await api.spaces.update(spaceId, {
      environmentId,
      primaryWorkbookId: workbookId,
      guestAuthentication: ["shared_link"],
      translationsPath:
        "https://raw.githubusercontent.com/FlatFilers/Platform-Translations/main/locales/en/translation.json",
      metadata: {
        userId,
        sidebarConfig: {
          showSidebar: true,
        },
        theme,
      },
    });
  }
}
