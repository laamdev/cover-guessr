const prevMediaObj = {
  prev: 1,
  setPrev: function (num: number) {
    this.prev = num
  },
}

export const getRandomMedia = async (data: any) => {
  let randomIndex = prevMediaObj.prev

  while (randomIndex === prevMediaObj.prev) {
    randomIndex = Math.floor(Math.random() * data.length)
  }

  prevMediaObj.setPrev(randomIndex)

  return data[randomIndex]
}

// // export const getRandomMedia = async (array: any) => {
// //   let usedIndexArray = [] as number[]
// //   const max = array.length
// //   let randomIndex

// //   do {
// //     randomIndex = Math.floor(Math.random() * max)
// //   } while (usedIndexArray.includes(randomIndex))

// //   usedIndexArray.push(randomIndex)

// //   return array[randomIndex]
// // }
