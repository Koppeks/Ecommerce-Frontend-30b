import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import "./Profile.css";
import Compras from "../../components/Compras/Compras";
import { uploadPhotoToCloudinary } from "../../hooks/uploadToCloudinary";
import toast, { Toaster } from "react-hot-toast";

export default function Profile() {
  const { id } = useParams();
  const { datos, reFetch, resync } = useProfile(id);
  const { user, isLoading, isAuthenticated } = useAuth0();
  const [owner, setOwner] = useState(false);
  const [selected, setSelected] = useState("compras");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ nickname: datos.nickname, avatar: datos.avatar });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({ nickname: datos.nickname, avatar: datos.avatar });
  }, [datos]);

  useEffect(() => {
    fetch("https://ecommerce-frontend-30b.vercel.app/cart/getCart/", {
      method: "POST",
      body: JSON.stringify({ user: { email: datos.email } }),
      headers: new Headers({ "content-type": "application/json" }),
    })
      .then((answer) => answer.json())
      .then((data) => console.log(data));

    fetch("https://ecommerce-frontend-30b.vercel.app/wishlist/user/" + id, {
      method: "GET",
    })
      .then((answer) => answer.json())
      .then((data) => data);
  }, [datos, id]);

  useEffect(() => {
    if ((!isLoading, isAuthenticated)) {
      setOwner(user.email === datos.email);
    }
  }, [user, datos.email, isLoading, isAuthenticated]);

  async function handleSaveChanges() {
    fetch("https://ecommerce-frontend-30b.vercel.app/users/updateProfile/" + id, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: new Headers({ "content-type": "application/json" }),
    })
      .then((answer) => answer.json)
      .then((data) => {
        setEditing(false);
        toast.success("Cambios Guardados Correctamente");
        reFetch(!resync);
      })
      .catch((e) => toast.error("Algo salio mal"));
  }

  async function handleUploadPhoto(e) {
    setLoading(true);
    const response = uploadPhotoToCloudinary(e);
    const d = await response();
    setFormData({ ...formData, avatar: d[0], loading: false });
    setLoading(false);
  }

  return (
    <div id="profile_general_container">
      <div id="profile_header_container">
        <div id="profile_header_first">
          {editing ? (
            <div>
              {loading ? "Cargando foto..." : null}
              <img src={formData.avatar} alt="user" id="profile_user_photo"></img>
              <input type="file" onChange={(e) => handleUploadPhoto(e)}></input>
            </div>
          ) : (
            <img src={datos.avatar} alt="user" id="profile_user_photo"></img>
          )}

          {owner ? (
            <button id="profile_editar_btn" onClick={() => (editing ? handleSaveChanges() : setEditing(true))}>
              {editing ? "Guardar Cambios" : "Editar Perfil"}
            </button>
          ) : null}
        </div>
        <div id="profile_nickname_container">{editing ? <input value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}></input> : <div id="profile_nickname">{datos.nickname}</div>}</div>
        <div id="profile_buttons">
          <button className={selected === "compras" ? "profile_button_clicked" : "profile_button_unclicked"} onClick={() => setSelected("compras")}>
            Compras
          </button>
          <button className={selected === "fav" ? "profile_button_clicked" : "profile_button_unclicked"} onClick={() => setSelected("fav")}>
            Favoritos
          </button>
          <button className={selected === "cart" ? "profile_button_clicked" : "profile_button_unclicked"} onClick={() => setSelected("cart")}>
            Carro
          </button>
        </div>
      </div>
      <div>{selected === "compras" ? <Compras facturas={datos.facturas} /> : selected === "cart" ? null : null}</div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}
