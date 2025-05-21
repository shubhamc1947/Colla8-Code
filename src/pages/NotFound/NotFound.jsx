import { Link } from "react-router-dom"
import "./notfound.scss"
import { motion } from "framer-motion"
import { fadeDownVariant } from "../../utils/motionVarients"

const NotFound = () => {
  return (
    <motion.div className="notfound" variants={fadeDownVariant} initial="initial" animate="animate">
      <div className="notfound-content">
        <div className="error-code">404</div>
        <div className="code-snippet">
          <pre>
            <code>
              <span className="keyword">try</span> {"{"}
              <br />
              {"  "}findPage(<span className="string">&quot;{window.location.pathname}&quot;</span>);
              <br />
              {"}"} <span className="keyword">catch</span> (error) {"{"}
              <br />
              {"  "}console.error(<span className="string">&quot;404: Page not found&quot;</span>);
              <br />
              {"}"}
            </code>
          </pre>
        </div>
        <Link to="/" className="home-button">
          Back to Home
        </Link>
      </div>
    </motion.div>
  )
}

export default NotFound
