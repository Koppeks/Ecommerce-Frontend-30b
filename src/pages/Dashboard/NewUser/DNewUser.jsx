import styles from './DNewUser.module.scss';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import { DSidebar } from '../components/Sidebar/DSidebar';
import { DNavbar } from '../components/Navbar/DNavbar';
import { userInputs } from './formSource';

export const DNewUser = () => {
  const [file, setFile] = useState("");

  return (
    <div className={styles.new}>
      <DSidebar />
      <div className={styles.newContainer}>
        <DNavbar />
        <div className={styles.top}>
          <h1>Agregar Nuevo Producto</h1>
        </div>
        <div className={styles.bottom}>
          <div className={styles.left}>
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className={styles.right}>
            <form>
              <div className={styles.formInput}>
                <label htmlFor="file">
                  Imagen: <DriveFolderUploadOutlinedIcon className={styles.icon} />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {userInputs.map((input) => (
                <div className={styles.formInput} key={input.id}>
                  <label>{input.label}</label>
                  <input type={input.type} placeholder={input.placeholder} />
                </div>
              ))}
              <button>Enviar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}