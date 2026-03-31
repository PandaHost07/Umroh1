export const getData = async (model, id = null) => {
  const response = await fetch(
    `/api/akses/data?model=${model}${id ? `&&id=${id}` : ""}`
  );
  return response.json();
};

export async function postDataWithFile(data, model, metode, file = null, id = null) {
  const formData = new FormData();
  formData.append("form", JSON.stringify(data));
  if (file) {
    formData.append("file", file);
  }

  const res = await fetch(
    `/api/akses/dataWithImage?model=${model}${metode == "PATCH" && id ? `&&id=${id}` : "" // jika ingin melakukan update data
    } `,
    {
      method: metode,
      body: formData,
    }
  );

  return res;
}

export async function postData(data, model, metode, id = null) {
  const res = await fetch(
    `/api/akses/data?model=${model}${metode == "PATCH" && id ? `&&id=${id}` : "" // jika ingin melakukan update data
    }`,
    {
      method: metode,
      body: JSON.stringify(data),
    }
  );

  return res;
}
export async function delData(model, id) {
  const res = await fetch(`/api/akses/data?model=${model}&&id=${id}`, {
    method: "DELETE",
  });

  return res;
}
