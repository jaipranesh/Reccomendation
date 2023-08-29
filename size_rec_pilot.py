from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import sqlite3

app = Flask(__name__)
CORS(app)

def get_file():
    """
    Returns POCs Excel workbook from a file

    :return: {sheet_name : sheet_content_as_df}
    """
    data_dump = pd.read_excel(r"./size chart input.xlsx", sheet_name=None)
    return data_dump

@app.route('/submitFeedback', methods=['POST'])
def submit_feedback():
    data = request.json
    cBrand = data.get('cBrand')
    print("=================="+cBrand)
    size = data.get('size')
    nBrand = data.get('nBrand')
    nSize = data.get('nSize')
    satisfaction = data.get('satisfaction')
    feedback = data.get('comment')
    print(feedback)
    # Insert the feedback data into the database
    with sqlite3.connect(r'C:\Users\jaiprane\Reccomendation.db') as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO recommendations (using_brand, recc_brand, using_size, recc_size, satisfaction , feedback)
                VALUES (?, ?, ?, ?, ? , ?)
            ''', (cBrand, size, nBrand, nSize, satisfaction , feedback))
            conn.commit()

    return jsonify({'message': 'Feedback submitted successfully'})


@app.route('/getRecommend/<cur_brand>/<cur_size>/<new_brand>', methods=['GET'])
def get_recommendation(cur_brand,cur_size,new_brand):
    # Get parameters from frontend
    using_brand = cur_brand
    recc_brand = new_brand
    using_size = float(cur_size)

    # Define return_val and initialize it
    return_val = {
        "cBrand": cur_brand,
        "size": cur_size,
        "nBrand": new_brand,
        "nSize": ""
    }

    df_dict = get_file()
    if using_brand == recc_brand:
        return_val['error'] = "You have selected the same using and recommendation brand"
    else:
        df_used_brand = df_dict.get(using_brand)
        df_recc_brand = df_dict.get(recc_brand)

        if df_used_brand is None or df_recc_brand is None:
            return_val['error'] = "Brand data not found"
        else:
            using_heeltotoe = df_used_brand.loc[df_used_brand['Brand Size'] == using_size]['Heel to toe (in)']
            using_heel_to_toe = using_heeltotoe.item()

            try:
                df_recc_size = df_recc_brand.loc[df_recc_brand['Heel to toe (in)'] == using_heel_to_toe]
                recc_size = df_recc_size['Brand Size']
                recc_heel = df_recc_size['Heel to toe (in)']
                lenSeries=len(recc_size)
                indices=range(lenSeries)
                recc_size.index=indices
                reccom_size = recc_heel[0]
                lenSeries=len(recc_heel)
                indices=range(lenSeries)
                recc_heel.index=indices
                reccom_heel = recc_heel[0]

                # Check if the difference in heel to toe is less than 0.2 inches
                if abs(using_heel_to_toe - reccom_heel) <= 0.3:
                    return_val['nSize'] = reccom_size
                else:
                    return_val['error'] = "This size is not available in the asked brand"
            except KeyError:
                idx_low = df_recc_brand['Heel to toe (in)'].sub(using_heel_to_toe).abs().idxmin()
                df_low_size = df_recc_brand.loc[idx_low]
                brand_size_lower = df_low_size['Brand Size']
                brand_heel = df_low_size['Heel to toe (in)']
                print("Hello I am here")
                # Check if the difference in heel to toe is less than 0.2 inches
                if abs(using_heel_to_toe - brand_heel) <= 0.3:
                    return_val['nSize'] = brand_size_lower
                else:
                    return_val['error'] = "This size is not available in the asked brand"
    print(return_val)
    # Return the JSON response
    return jsonify(return_val)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1246)
