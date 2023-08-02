import { GetStaticProps, InferGetStaticPropsType } from "next";

import { createSwaggerSpec } from "next-swagger-doc";
import { ReactElement } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SwaggerUI spec={spec} />;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const title = "HCM.show API Documentation";

  const spec: Record<string, any> = createSwaggerSpec({
    title,
    apiFolder: "pages/api",
    version: "0.1.0",
    definition: {
      openapi: "3.0.0",
      info: {
        title,
        version: "1.0",
      },
      components: {
        // securitySchemes: {
        //   BearerAuth: {
        //     type: "http",
        //     scheme: "bearer",
        //     bearerFormat: "JWT",
        //   },
        // },
      },
      security: [],
    },
  });
  return { props: { spec } };
};

ApiDoc.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default ApiDoc;
