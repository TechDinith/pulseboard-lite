import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ActivityEvent, Board, Member } from "@/types";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  }),
  tagTypes: ["Members", "Board", "Activity"],
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
  }),
});

export const {
  useGetMembersQuery,
  useGetBoardQuery,
  useGetActivityQuery,
} = apiSlice;
