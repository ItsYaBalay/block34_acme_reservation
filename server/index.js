const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());

app.get(`/api/customers`, async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(error);
  }
});
app.get(`/api/restaurants`, async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(error);
  }
});
app.get(`/api/reservations`, async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(error);
  }
});
app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    // res.status(201).send(
    //   await createReservation({
    //     customer_id: req.params.customer_id,
    //     restaurant_id: req.body.restaurant_id,
    //     date: req.body.date,
    //     party_count: req.body.party_count,
    //   })
    // );

    const response = await createReservation({
      customer_id: req.params.customer_id,
      restaurant_id: req.body.restaurant_id,
      date: req.body.date,
      party_count: req.body.party_count,
    });

    res.send(response);
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  const [moe, lucy, larry, ethyl, mcd, bk, tacobell] = await Promise.all([
    createCustomer({ name: "moe" }),
    createCustomer({ name: "lucy" }),
    createCustomer({ name: "larry" }),
    createCustomer({ name: "ethyl" }),
    createRestaurant({ name: "mcdonalds" }),
    createRestaurant({ name: "burgerking" }),
    createRestaurant({ name: "tacobell" }),
  ]);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation1, reservation2] = await Promise.all([
    createReservation({
      customer_id: moe.id,
      restaurant_id: bk.id,
      date: "02/14/2024",
      party_count: 3,
    }),
    createReservation({
      customer_id: moe.id,
      restaurant_id: tacobell.id,
      date: "02/28/2024",
      party_count: 5,
    }),
  ]);
  console.log(await fetchReservations());
  await destroyReservation({
    id: reservation1.id,
    customer_id: reservation1.customer_id,
  });
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

init();
