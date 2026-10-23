import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ActivityEvent, Board, Member } from "@/types";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  tenantId: string;
  tenantName: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  tenantName: string;
  displayName: string;
  email: string;
  password: string;
}

export interface BoardSummary {
  id: string;
  name: string;
  createdAt: string;
}

export interface CardSummary {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  assigneeId: string | null;
  assigneeName: string | null;
  labels: string | null;
  dueAt: string | null;
  position: number;
}

export interface ColumnWithCards {
  id: string;
  name: string;
  position: number;
  cards: CardSummary[];
}

export interface BoardDetail {
  id: string;
  name: string;
  columns: ColumnWithCards[];
}

export interface CreateCardInput {
  columnId: string;
  title: string;
  description?: string;
  priority?: string;
  assigneeId?: string;
  labels?: string;
  dueAt?: string;
  position?: number;
}

export interface UpdateCardInput {
  title?: string;
  description?: string;
  priority?: string;
  assigneeId?: string;
  labels?: string;
  dueAt?: string;
}

export interface MoveCardInput {
  columnId: string;
  position: number;
}

export interface ExportResponse {
  id: string;
  boardId: string;
  status: string;
  createdAt: string;
}

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
  tagTypes: ["Members", "Board", "Activity", "Boards", "Exports"],
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
    login: builder.mutation<AuthResult, LoginInput>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    register: builder.mutation<AuthResult, RegisterInput>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => "/auth/me",
    }),
    listBoards: builder.query<BoardSummary[], void>({
      query: () => "/boards",
      providesTags: ["Boards"],
    }),
    getBoardDetail: builder.query<BoardDetail, string>({
      query: (id) => `/boards/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Board", id }],
    }),
    createBoard: builder.mutation<BoardSummary, { name: string }>({
      query: (body) => ({ url: "/boards", method: "POST", body }),
      invalidatesTags: ["Boards"],
    }),
    addColumn: builder.mutation<ColumnWithCards, { boardId: string; name: string }>({
      query: ({ boardId, ...body }) => ({ url: `/boards/${boardId}/columns`, method: "POST", body }),
      invalidatesTags: (_res, _err, arg) => [{ type: "Board", id: arg.boardId }],
    }),
    createCard: builder.mutation<CardSummary, CreateCardInput>({
      query: (body) => ({ url: "/cards", method: "POST", body }),
      invalidatesTags: ["Board"],
    }),
    updateCard: builder.mutation<CardSummary, { id: string; body: UpdateCardInput }>({
      query: ({ id, body }) => ({ url: `/cards/${id}`, method: "PUT", body }),
      invalidatesTags: ["Board"],
    }),
    moveCard: builder.mutation<CardSummary, { id: string; body: MoveCardInput }>({
      query: ({ id, body }) => ({ url: `/cards/${id}/move`, method: "PATCH", body }),
      invalidatesTags: ["Board"],
    }),
    deleteCard: builder.mutation<void, string>({
      query: (id) => ({ url: `/cards/${id}`, method: "DELETE" }),
      invalidatesTags: ["Board"],
    }),
    requestExport: builder.mutation<ExportResponse, { boardId: string }>({
      query: (body) => ({ url: "/exports", method: "POST", body }),
      invalidatesTags: ["Exports"],
    }),
    listExports: builder.query<ExportResponse[], void>({
      query: () => "/exports",
      providesTags: ["Exports"],
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
  useRequestExportMutation,
  useListExportsQuery,
} = apiSlice;
