# -*- coding: utf-8 -*-
"""

@author: Shubham
"""

import math
import pandas as pd
import numpy as np
import sklearn
from sklearn.cluster import KMeans

data_count = 500;
cluster_count = 2;
cluster_range = range(0,cluster_count)
component_no = 2
prefix = "r_"
pca_filename = "pcaout.csv"
scree_filename = "screeout.csv"
mds_filename = "mdsout"
iso_filename = "isoout.csv"

def mainFunc():
    global prefix
    randomData()
    
    
def randomData():
    data = pd.read_csv('hygdata_v3.csv',iterator = True, dtype='unicode')
    #print pd.concat([chunk[2] for chunk in data])
    df = pd.concat([chunk[chunk['hr'] > 0] for chunk in data])
    df = df.drop('id',1)
    df = df.drop('hip',1)
    df = df.drop('hd',1)
    df = df.drop('gl',1)
    df = df.drop('bf',1)
    df = df.drop('pmra',1)
    df = df.drop('pmdec',1)
    df = df.drop('rv',1)
    df = df.drop('x',1)
    df = df.drop('y',1)
    df = df.drop('z',1)
    df = df.drop('vx',1)
    df = df.drop('vy',1)
    df = df.drop('vz',1)
    df = df.drop('ra',1)
    df = df.drop('dec',1)
    df = df.drop('pmrarad',1)
    df = df.drop('pmdecrad',1)
    df = df.drop('bayer',1)
    df = df.drop('flam',1)
    df = df.drop('comp',1)
    df = df.drop('comp_primary',1)
    df = df.drop('base',1)
    df = df.drop('lum',1)
    df = df.drop('var',1)
    df = df.drop('var_min',1)
    df = df.drop('var_max',1)
    for index, data in df.iterrows():
        
        data['ci'] = bv2rgb(float(data['ci']))
    df.to_csv('out.csv', sep=',', na_rep = 'N/A', index = False)
    #print data
    #print df
    
def bv2rgb(bv):
    if math.isnan(bv):
        bc = 0
    if bv < -0.4: bv = -0.4
    if bv > 2.0: bv = 2.0
    if bv >= -0.40 and bv < 0.00:
        t = (bv + 0.40) / (0.00 + 0.40)
        r = 0.61 + 0.11 * t + 0.1 * t * t
        g = 0.70 + 0.07 * t + 0.1 * t * t
        b = 1.0
    elif bv >= 0.00 and bv < 0.40:
        t = (bv - 0.00) / (0.40 - 0.00)
        r = 0.83 + (0.17 * t)
        g = 0.87 + (0.11 * t)
        b = 1.0
    elif bv >= 0.40 and bv < 1.60:
        t = (bv - 0.40) / (1.60 - 0.40)
        r = 1.0
        g = 0.98 - 0.16 * t
    else:
        t = (bv - 1.60) / (2.00 - 1.60)
        r = 1.0
        g = (0.82 - 0.5) * t * t
    if bv >= 0.40 and bv < 1.50:
        t = (bv - 0.40) / (1.50 - 0.40)
        b = 1.00 - 0.47 * t + 0.1 * t * t
    elif bv >= 1.50 and bv < 1.951:
        t = (bv - 1.50) / (1.94 - 1.50)
        b = 0.63 - 0.6 * t * t
    else:
        b = 0.0
    if bv == 'nan' or math.isnan(bv):
        g = 0.5
    g /= 1.1
    return "rgb({0}, {1}, {2})".format(int(r*255),int(g*255),int(b*255))
    
mainFunc()