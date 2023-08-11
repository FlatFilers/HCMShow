import { useSpace } from "@flatfile/react";

type Props = {
  spaceProps: any;
};

const EmbeddedSpace = ({ spaceProps }: Props) => {
  const space = useSpace({ ...spaceProps });

  return space;
};

export default EmbeddedSpace;
