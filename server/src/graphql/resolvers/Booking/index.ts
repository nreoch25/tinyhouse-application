import { IResolvers } from "@graphql-tools/utils";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { Booking, Database, Listing, BookingsIndex } from "../../../lib/types";
import { CreateBookingArgs } from "./types";
import { authorize } from "../../../lib/utils";
import { Stripe } from "../../../lib";

export const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear(); // year
    const m = dateCursor.getUTCMonth(); // month
    const d = dateCursor.getUTCDate(); // day

    if (!newBookingsIndex[y]) {
      newBookingsIndex[y] = {};
    }

    if (!newBookingsIndex[y][m]) {
      newBookingsIndex[y][m] = {};
    }

    if (!newBookingsIndex[y][m][d]) {
      newBookingsIndex[y][m][d] = true;
    } else {
      throw new Error("selected dates can't overlap dates that have already been booked");
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};

export const bookingResolvers: IResolvers = {
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Booking> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        const viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
        }

        const listing = await db.listings.findOne({
          _id: new ObjectId(id),
        });
        if (!listing) {
          throw new Error("listing can't be found");
        }

        if (listing.host === viewer._id) {
          throw new Error("viewer can't book own listing");
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate < checkInDate) {
          throw new Error("check out date can't be before check in date");
        }

        const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

        const totalPrice =
          listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

        const host = await db.users.findOne({
          _id: listing.host,
        });

        if (!host || !host.walletId) {
          throw new Error("the host either can't be found or is not connected with Stripe");
        }

        await Stripe.charge(totalPrice, source, host.walletId);

        const newBooking: Booking = {
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut,
        };

        const insertResult = await db.bookings.insertOne(newBooking);

        await db.users.updateOne({ _id: host._id }, { $inc: { income: totalPrice } });

        await db.users.updateOne(
          { _id: viewer._id },
          { $push: { bookings: insertResult.insertedId } }
        );

        await db.listings.updateOne(
          { _id: listing._id },
          {
            $set: { bookingsIndex },
            $push: { bookings: insertResult.insertedId },
          }
        );

        return newBooking;
      } catch (error) {
        throw new Error(`Failed to create a booking: ${error}`);
      }
    },
  },
  Booking: {
    id: (booking: Booking): string => {
      return booking._id.toString();
    },
    listing: (
      booking: Booking,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: booking.listing });
    },
    tenant: (booking: Booking, _args: Record<string, unknown>, { db }: { db: Database }) => {
      return db.users.findOne({ _id: booking.tenant });
    },
  },
};
