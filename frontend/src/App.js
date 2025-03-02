import "./App.css";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { PayPalScriptProvider } from "@paypal/react-paypal-js"; // Import PayPal provider
import CheckoutPage from "./components/CheckoutPage";
import Home from "./components/Home";
import NavBar from "./components/NavBar";
import NotFound from "./components/NotFound";
import Cart from "./components/Cart";

import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <PayPalScriptProvider options={{ "client-id": "ATK61P3NBCSyS2go82ZyYqtKRsdlv8csykeBfLOB8RauQqXnVr9vg533MJkds2OG82bP2xZ15SfZmCun" }}>
      <div className="App">
        <BrowserRouter>
          <ToastContainer />
          <NavBar />
          <div className="content-container">
            <Switch>
              <Route path="/cart" component={Cart} />
              <Route path="/not-found" component={NotFound} />
              <Route path="/" exact component={Home} />
              <Route path="/CheckoutPage" exact component={CheckoutPage} />
              <Redirect to="/not-found" />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    </PayPalScriptProvider>
  );
}

export default App;
