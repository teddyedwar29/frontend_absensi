import API from "../api/auth";

// Ambil semua komplain
export const fetchKomplains = async () => {
  const res = await API.get("/komplain");
  return res.data;
};

// Create komplain
export const createComplain = async (formData) => {
  const res = await API.post("/komplain", {
    ...formData,
  });
  return res.data;
};

// Update status
export const updateComplainStatus = async (id, status_komplain, pic_updated, keterangan = "") => {
  const res = await API.put(`/komplain/${id}`, {
    status_komplain,
    pic_updated,
    keterangan,
  });
  return res.data;
};

// Delete komplain
export const deleteComplain = async (id) => {
  const res = await API.delete(`/komplain/${id}`);
  return res.data;
};
