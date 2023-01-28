export const convertToCamelCase = (obj: { [key: string]: any }) => {
  const newObj: { [key: string]: any } = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = convertKeyToCamelCase(key);
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
};

export const convertKeyToCamelCase = (key: string) => {
  return key.replace(/_([a-z])/g, (match) => match[1].toUpperCase());
};
