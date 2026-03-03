import api from "../middleware/apiMiddleware";

export const loginApi = async (email, password) => {
    const response = await api.post("/login", {
        email,
        password,
    });
    return response.data;
};