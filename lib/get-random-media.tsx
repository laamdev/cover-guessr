const prevMediaObj = {
  prev: 1,
  generatedIndices: [],
  setPrev: (num: number) => {
    prevMediaObj.prev = num;
    prevMediaObj.generatedIndices.push(num);
  },
  reset: () => {
    prevMediaObj.generatedIndices = [];
  }
};

export const getRandomMedia = async (data: any) => {
  if (prevMediaObj.generatedIndices.length === data.length) {
    prevMediaObj.reset();
  }

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * data.length);
  } while (prevMediaObj.generatedIndices.includes(randomIndex));

  prevMediaObj.setPrev(randomIndex);

  return data[randomIndex];
}
