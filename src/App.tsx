import  { useState } from "react";
import { FormContainer, FormGroup, HomeContainer, ListContainer } from "./App";
import { GlobalStyles } from "./styles/global";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "./lib/axios";

const formSchema = zod.object({
  cBrand: zod.string(),
  size: zod.string(),
  nBrand: zod.string(),
});

type fetchFormData = {
  cBrand: string;
  size: string;
  nBrand: string;
nSize: string;

};
type AvailableSizesByBrand = {
  [brand: string]: string[];
};

export function App() {   const [details, setDetails] = useState<fetchFormData[]>([]);
  const [satisfaction, setSatisfaction] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
{/*const [recommendedSize, setRecommendedSize] = useState<string>("");*/}
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sizeNA, setSizeNA] = useState<boolean>(false);
  const [showCommentBox, setShowCommentBox] = useState<boolean>(false);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [selectedRecommendation, setSelectedRecommendation] = useState<fetchFormData | null>(null);
  const [availableSizesByBrand, _setAvailableSizesByBrand] = useState<AvailableSizesByBrand>({
    Adidas: ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13","13.5","14"],
    Reebok: ["2","2.5","3","3.5","4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"],
    NewBalance: ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13","13.5","14"],
    Vans : ["3.5","4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    Woodlands : ["5","6","7","8","9","10","11"],
    Puma : ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13","13.5","14","14.5","15","15.5","16"],
    Asics : ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    Crocs: ["2" , "3","4", "5", "6", "7", "8", "9","10","11","12","13","14","15","16","17"],
    Nike : ["6" , "7" , "8","9","10","11","12","13"]
  });
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  const brands = ["Adidas", "New Balance", "Crocs", "Vans", "Puma", "Woodlands", "Reebok", "Asics", "Nike"];


  const onSubmit = async (data: fetchFormData) => {
    setErrorMessage(""); 
    const { cBrand, size, nBrand } = data;
    console.log("Submitting form with data")
{/*
    if (cBrand === nBrand) {
      setErrorMessage("Please choose a different brand for 'New Brand'");
      return;
    }
  */}
    try {
      const response = await api.get(`http://127.0.0.1:1246/getRecommend/${cBrand}/${size}/${nBrand}`);
      
      const newData: fetchFormData = response.data;
      setDetails((state) => [newData, ...state]);
      if (newData.nSize === "") {
        setSizeNA(true);
        setErrorMessage("This size is not available in the asked brand");
      } else {
        setSizeNA(false);
        setErrorMessage("");
      }
      //setRecommendedSize(newData.nSize);
      setSelectedRecommendation(newData);
      setShowFeedback(true);
  
      reset();
      setSatisfaction("");
    } catch (error) {
      const errorMessage = error as string;
      setErrorMessage("Error fetching recommendation: " + errorMessage);
      setSizeNA(false); 
      console.error("Error fetching recommendation:", errorMessage);
    }
  };

  const submitFeedback = async () => {
    try {
      const response = await api.post("http://127.0.0.1:1246/submitFeedback", {
        cBrand: selectedRecommendation?.cBrand,
        size: selectedRecommendation?.size,
        nBrand: selectedRecommendation?.nBrand,
        nSize: selectedRecommendation?.nSize,
        satisfaction: satisfaction,
        comment: feedbackComment,
      });

      console.log(response.data.message); // You can handle the response message as needed
      if (satisfaction === "no") {
        setShowCommentBox(true);
      } else {
        setShowCommentBox(false);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const { register, handleSubmit, reset ,setValue} = useForm<fetchFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cBrand: "",
      size: "",
      nBrand: "",
    },
  });

  const handleUsingBrandChange = (selectedBrand: string) => {
    // Update the available sizes based on the selected brand
    const sizes = availableSizesByBrand[selectedBrand] || [];
    setAvailableSizes((prevSizes) => ({ ...prevSizes, [selectedBrand]: sizes }));
    setValue("size", "");
    setValue("cBrand", selectedBrand); // Set the selected brand
    setAvailableSizes(sizes);
  };

{/*
  const handleUsingBrandChange = (selectedBrand: string) => {
    // Update the available sizes based on the selected brand
    const sizes = availableSizes[selectedBrand] || [];
    reset({ ...watch(), size: "" }); // Reset the size field to prevent submitting invalid sizes
  };
  

  async function onSubmit(data: fetchFormData) {
    const { cBrand, size, nBrand } = data;
    const response = await api.get(`/getRecommend?using_brand=${cBrand}&recc_brand=${nBrand}&using_size=${size}`);
  
    const newData: fetchFormData = response.data;
    setRecommendedSize(newData.nSize);
    setShowFeedback(true);
  
    reset();
    setSatisfaction("");
  }
*/}
 return (
    <>
      <GlobalStyles />
      <HomeContainer>
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          <h2>Shoe Size Recommender</h2>

          <FormGroup>
            <label htmlFor="cBrand">Using Brand</label>
            <select
              id="cBrand"
              {...register("cBrand")}
              onChange={(e) => {
                handleUsingBrandChange(e.target.value);
              }}
            >
              <option value="" disabled>
                Choose one
              </option>
              {Object.keys(availableSizesByBrand).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <label htmlFor="size">Size</label>
            <select id="size" {...register("size")} disabled={!availableSizes.length}>
              <option value="" disabled>
                Choose one
              </option>
              {availableSizes.map((sizeOption: string) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </select>
          </FormGroup>
          <FormGroup>
            <label htmlFor="nBrand">New Brand</label>
            <select id="nBrand" {...register("nBrand")}>
              <option value="" disabled>
                Choose one
              </option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <button type="submit">Get Recommendation</button>
          </FormGroup>
        </FormContainer>

        <ListContainer>
          {errorMessage !== "" && <p style={{ color: "red" }}>{errorMessage}</p>}
            <h2>Recommendation</h2>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>Current Brand</th>
                      <th>Size</th>
                      <th>New Brand</th>
                      <th>New Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((emp, index) => (
                      <tr key={index}>
                        <td>{emp.cBrand}</td>
                        <td>{emp.size}</td>
                        <td>{emp.nBrand}</td>
                        <td style={{ color: sizeNA ? "red" : "white" }}>
                          {emp.nSize === "" ? "Size NA in this brand" : emp.nSize}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        </ListContainer>

        
        {showFeedback && (
  <ListContainer>
    <h2>Feedback</h2>
    <FormGroup>
      <p>Are you satisfied with the recommendation feature?</p>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            value="yes"
            checked={satisfaction === 'yes'}
            onChange={(e) => {
              setSatisfaction(e.target.value);
              setShowCommentBox(false);
              setFeedbackComment("");
            }}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            value="no"
            checked={satisfaction === 'no'}
            onChange={(e) => {
              setSatisfaction(e.target.value);
              setShowCommentBox(true);
            }}
          />
          No
        </label>
      </div>
      {showCommentBox && (
        <div>
          <label htmlFor="feedbackComment">Please provide your feedback:</label>
          <textarea
            id="feedbackComment"
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
          />
        </div>
      )}
    </FormGroup>

    <FormGroup style={{ textAlign: "center" }}>
      <button onClick={submitFeedback}>Submit Feedback</button>
    </FormGroup>
  </ListContainer>
)}

      </HomeContainer>
    </>
  );
}
