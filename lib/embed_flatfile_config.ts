export const config = {
  slug: "Imma slug",
  name: "Editable Name",
  blueprints: [
    {
      slug: "persistent-slug123",
      name: "Blueprint name",
      primary: true,
      sheets: [
        {
          name: "HCM Show Sheet",
          description: "HCM Show Sheet",
          slug: "HCM Show Sheet",
          fields: [
            {
              key: "first_name",
              type: "string",
              label: "Hello world",
              description: "The first name",
              constraints: [
                {
                  type: "required",
                },
              ],
            },
            {
              key: "email",
              type: "string",
              label: "Email",
              description: "The person's email",
              constraints: [
                {
                  type: "unique",
                },
              ],
            },
            {
              key: "subscriber",
              type: "boolean",
              label: "Subscriber?",
              description: "Whether the person is already a subscriber",
            },
            {
              key: "type",
              type: "enum",
              label: "Deal Status",
              description: "The deal status",
              config: {
                options: [
                  {
                    value: "new",
                    label: "New",
                  },
                  {
                    value: "interested",
                    label: "Interested",
                  },
                  {
                    value: "meeting",
                    label: "Meeting",
                  },
                  {
                    value: "opportunity",
                    label: "Opportunity",
                  },
                  {
                    value: "unqualified",
                    label: "Not a fit",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
