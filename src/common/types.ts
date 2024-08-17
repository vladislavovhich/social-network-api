export type DateFilterType = "today" | "week" | "month" | "year"

export enum DateFilterEnum {
    TODAY = "today",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year"
}

export type PostFilterType = "popular" | "controversial" | "hot" | "now"

export enum PostFilterEnum {
    POPULAR = "popular",
    CONTROVERSIAL = "controversial",
    HOT = "hot",
    NOW = "now"
}

export type BelongsFunctionType = (itemId: number, userId: number) => Promise<void>

export enum DateOrderEnum {
    before = "before",
    after = "after"
}