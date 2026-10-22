import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ActivityEvent, Board, Member } from "@/types";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api",
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("pulseboard_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Members", "Board", "Activity", "Boards"],
  endpoints: (builder) => ({
    getMembers: builder.query<Member[], void>({
      query: () => "/members",
      providesTags: ["Members"],
    }),
    getBoard: builder.query<Board, void>({
      query: () => "/board",
      providesTags: ["Board"],
    }),
    getActivity: builder.query<ActivityEvent[], void>({
      query: () => "/activity",
      providesTags: ["Activity"],
    }),
    login: builder.mutation<{ token: string; user: any }, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    register: builder.mutation<{ token: string; user: any }, any>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    getMe: builder.query<any, void>({
      query: () => "/auth/me",
    }),
    listBoards: builder.query<any[], void>({
      query: () => "/boards",
      providesTags: ["Boards"],
    }),
    getBoardDetail: builder.query<any, string>({
      query: (id) => `/boards/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Board", id }],
    }),
    createBoard: builder.mutation<any, { name: string }>({
      query: (body) => ({ url: "/boards", method: "POST", body }),
      invalidatesTags: ["Boards"],
    }),
    addColumn: builder.mutation<any, { boardId: string; name: string }>({
      query: ({ boardId, ...body }) => ({ url: `/boards/${boardId}/columns`, method: "POST", body }),
      invalidatesTags: (_res, _err, arg) => [{ type: "Board", id: arg.boardId }],
    }),
    createCard: builder.mutation<any, any>({
      query: (body) => ({ url: "/cards", method: "POST", body }),
      invalidatesTags: ["Board"],
    }),
    updateCard: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/cards/${id}`, method: "PUT", body }),
      invalidatesTags: ["Board"],
    }),
    moveCard: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/cards/${id}/move`, method: "PATCH", body }),
      invalidatesTags: ["Board"],
    }),
    deleteCard: builder.mutation<void, string>({
      query: (id) => ({ url: `/cards/${id}`, method: "DELETE" }),
      invalidatesTags: ["Board"],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useGetBoardQuery,
  useGetActivityQuery,
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useListBoardsQuery,
  useGetBoardDetailQuery,
  useCreateBoardMutation,
  useAddColumnMutation,
  useCreateCardMutation,
  useUpdateCardMutation,
  useMoveCardMutation,
  useDeleteCardMutation,
} = apiSlice;
