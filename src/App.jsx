import Products from "./pages/Products/Products";
import { Route, Routes, useLocation } from "react-router-dom";
import { localStorageCart } from "./redux/slices/cartSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cart from "./pages/Cart/Cart";
import NavBar from "./components/NavBar/NavBar";
import Detalles from "./pages/Detalles/Detalles";
import AddArticle from "./pages/AddArticle/AddArticle";
import SuccessPurchase from "./pages/SuccessPurchase/SuccessPurchase";
import { useAuth0 } from "@auth0/auth0-react";
import "./index.module.scss";
import MetaMaskStatus from "./pages/MetaMaskStatus/MetaMaskStatus";
import { Home } from "./pages/Home/Home";
import { Footer } from "./components/Footer/Footer";
import { BottomNav } from "./components/BottomNavigation/BottomNav";
import { addWidthAndHeight } from "./redux/slices/windowSlice";
import Profile from "./pages/Profile/Profile";
import toast, { Toaster } from "react-hot-toast";
import NotFound from "./pages/NotFound/NotFound";
import { inputUserData } from "./redux/slices/userSlice";

//MercadoPago
import { useMercadopago } from "react-sdk-mercadopago";

function App() {
  const dispatch = useDispatch();
  const carro = useSelector((state) => state.cart.cartItems);
  const [peticion, setPeticion] = useState(false);
  const [sentCarro, setSentCarro] = useState(carro);

  const { user, isAuthenticated, isLoading } = useAuth0();

  // eslint-disable-next-line
  const mercadopago = useMercadopago.v2("TEST-4d76826e-3115-416c-bc70-f7a46fa75820", {
    locale: "es-AR",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      dispatch(localStorageCart(JSON.parse(window.localStorage.getItem("cart"))));
    }
  }, [dispatch, isLoading, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetch("http://localhost:3001/users/checkGoogleFacebook", {
        method: "POST",
        body: JSON.stringify(user),
        headers: new Headers({ "content-type": "application/json" }),
      })
        .then((answer) => answer.json())
        .then((data) => dispatch(inputUserData(data)))
        .then(() =>
          fetch("http://localhost:3001/cart/getCart", {
            method: "POST",
            body: JSON.stringify({ user }),
            headers: new Headers({ "content-type": "application/json" }),
          })
            .then((answer) => answer.json())
            .then((data) => {
              data.articles.length > 0
                ? dispatch(
                    localStorageCart(
                      data.articles.map((x) => {
                        return { ...x, quantity: x.cartitems.quantity };
                      })
                    )
                  )
                : dispatch(localStorageCart(JSON.parse(window.localStorage.getItem("cart"))));
            })
        );
    }
  }, [isLoading, isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (!peticion && carro !== sentCarro) {
        setSentCarro(carro);
        fetch("http://localhost:3001/cart/updateCart", {
          method: "POST",
          body: JSON.stringify({ user, carro }),
          headers: new Headers({ "content-type": "application/json" }),
        })
          .then(() => {
            toast.success("Carro Actualizado!");
            setPeticion(false);
          })
          .catch((e) => toast.error("Error actualizando el carro."));
      }
    }
  }, [carro, user, isLoading, isAuthenticated, peticion, sentCarro]);

  // add Width y Height

  useEffect(() => {
    const handleWindowResize = () => {
      dispatch(addWidthAndHeight({ innerWidth: window.innerWidth }));
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [dispatch]);

  // Fin add Width y Height

  if (useLocation().pathname.split("/")[1] !== "admin")
    return (
      <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/detalles/:id" element={<Detalles />} />
          <Route path="/MetaMaskStatus/:id" element={<MetaMaskStatus />} />
          <Route path="/addItem" element={<AddArticle />} />
          <Route path="/successBuy" element={<SuccessPurchase />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
        <Footer />
        <BottomNav />

        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    );
  else
    <div>
      <Routes>
        <Route path="/admin/purchases" element={<Home />}>
          <Route path="*" element={<NotFound />}></Route>
        </Route>
      </Routes>
    </div>;
}

export default App;
