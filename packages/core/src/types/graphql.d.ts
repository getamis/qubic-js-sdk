// This file is for align the types between frontend and backend API schema

type ID = string;

type Time = string;

type Address = string;

type Hash = string;

type Hex = string;

type Long = string;

type Bigint = string; // Backend type is `BigInt`. But it conflicts with the global BigInt type.

type Decimal = string;

type PageInfo = {
  endCursor: string | null;
};
