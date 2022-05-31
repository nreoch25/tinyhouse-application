import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { Moment } from "moment";
import { Col, Row, Layout } from "antd";
import { useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { LISTING } from "../../lib/graphql/queries";
import {
  Listing as ListingData,
  ListingVariables,
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import { PageSkeleton, ErrorBanner } from "../../lib/components";
import { ListingDetails } from "./components/ListingDetails";
import { ListingBookings } from "./components/ListingBookings";
import { CreateBooking } from "./components/CreateBooking";
import { CreateBookingModal } from "./components/CreateBookingModal";
import { Viewer } from "../../lib/types";
import { useScrollTop } from "../../lib/hooks/useScrollTop";

interface MatchParams {
  id: string;
}

interface Props {
  viewer: Viewer;
}

const PAGE_LIMIT = 3;
const { Content } = Layout;

const Listing = ({ viewer }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);
  const stripePromise = useMemo(() => loadStripe(`${process.env.REACT_APP_S_PUBLISHABLE_KEY}`), []);

  const { id } = useParams<MatchParams>();

  const { loading, data, error, refetch } = useQuery<ListingData, ListingVariables>(LISTING, {
    variables: {
      id,
      bookingsPage,
      limit: PAGE_LIMIT,
    },
  });

  useScrollTop();

  const clearBookingData = () => {
    setModalVisible(false);
    setCheckInDate(null);
    setCheckOutDate(null);
  };

  const handleListingRefetch = async () => {
    await refetch();
  };

  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listing">
        <ErrorBanner description="This listing may not exist or we've encountered an error." />
        <PageSkeleton />
      </Content>
    );
  }

  const listing = data ? data.listing : null;
  const listingBookings = listing ? listing.bookings : null;

  const listingDetailsElement = listing ? <ListingDetails listing={listing} /> : null;

  const listingBookingsElement = listingBookings ? (
    <ListingBookings
      listingBookings={listingBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  const createBookingElement = listing ? (
    <CreateBooking
      viewer={viewer}
      price={listing.price}
      host={listing.host}
      bookingsIndex={listing.bookingsIndex}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      setCheckInDate={setCheckInDate}
      setCheckOutDate={setCheckOutDate}
      setModalVisible={setModalVisible}
    />
  ) : null;

  const listingCreateBookingModalElement =
    listing && checkInDate && checkOutDate ? (
      <Elements stripe={stripePromise}>
        <CreateBookingModal
          id={listing.id}
          price={listing.price}
          modalVisible={modalVisible}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          setModalVisible={setModalVisible}
          clearBookingData={clearBookingData}
          handleListingRefetch={handleListingRefetch}
        />
      </Elements>
    ) : null;

  return (
    <Content className="listings">
      <Row gutter={24} justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
        <Col xs={24} lg={10}>
          {createBookingElement}
        </Col>
      </Row>
      {listingCreateBookingModalElement}
    </Content>
  );
};

export { Listing };
