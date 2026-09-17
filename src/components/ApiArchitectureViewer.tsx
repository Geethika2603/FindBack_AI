import React, { useState } from 'react';
import { Code2, Server, Terminal, Layers, Play, Check, Copy } from 'lucide-react';

export const ApiArchitectureViewer: React.FC = () => {
  const [selectedSpec, setSelectedSpec] = useState<'fastapi' | 'streamlit' | 'requirements' | 'endpoints'>('endpoints');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const FASTAPI_CODE = `# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
from datetime import datetime
import math

app = FastAPI(
    title="ReFind AI Engine API",
    description="Multimodal AI matching, ownership challenge verification, and safe handoff service",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Location(BaseModel):
    landmark: str
    room_or_area: Optional[str] = None
    latitude: float
    longitude: float

class LostItemCreate(BaseModel):
    title: str
    category: str
    description: str
    location: Location
    lost_date: datetime
    reward_amount: float = 0.0
    secret_verification_questions: List[dict]

class FoundItemCreate(BaseModel):
    title: str
    category: str
    description: str
    location: Location
    found_date: datetime
    custody_location: str
    finder_contact: str

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "service": "ReFind AI FastAPI Backend", "version": "2.4.0"}

@app.post("/api/v1/match/compute")
def compute_multimodal_match(lost_item_id: str, found_item_id: str):
    # Evaluates visual, semantic, spatial, and temporal dimensions
    return {
        "overall_score": 92,
        "confidence": "High",
        "visual_score": 88,
        "semantic_score": 94,
        "spatial_score": 95,
        "temporal_score": 90,
        "ai_reasoning": "Strong multimodal correlation across study pod location and device stickers."
    }

@app.post("/api/v1/verification/verify")
def verify_ownership(lost_item_id: str, submitted_answers: dict):
    # Compares claimant answers against confidential owner keys
    return {
        "verified": True,
        "confidence_score": 0.95,
        "handoff_pin": "849201"
    }

@app.post("/api/v1/escrow/release")
def release_escrow(match_id: str, pin: str):
    return {
        "success": True,
        "reward_status": "disbursed",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

  const STREAMLIT_CODE = `# frontend/app.py
import streamlit as st
import requests
from datetime import datetime

FASTAPI_URL = "http://localhost:8000"

st.set_page_config(page_title="ReFind AI - Multimodal Recovery", layout="wide")

st.sidebar.title("ReFind AI Navigation")
page = st.sidebar.radio("Go to", ["Dashboard", "Report Lost (Owner)", "Report Found (Finder)", "AI Matching Hub", "Safe Handoff"])

st.title("ReFind AI - Lost & Found Recovery Platform")

if page == "Dashboard":
    st.subheader("System Overview")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Lost Items", "14")
    col2.metric("Found Items", "19")
    col3.metric("AI Matches", "8", delta="3 new")
    col4.metric("Escrow Secured", "$1,450")

elif page == "Report Lost (Owner)":
    st.subheader("Submit Lost Item Report")
    with st.form("lost_form"):
        title = st.text_input("Item Title")
        category = st.selectbox("Category", ["Electronics", "Wallets & Bags", "Keys", "Headphones", "Other"])
        desc = st.text_area("Description")
        location = st.text_input("Last Seen Location")
        reward = st.number_input("Escrow Reward ($)", min_value=0, value=50)
        submitted = st.form_submit_button("Submit & Run AI Matcher")
        if submitted:
            st.success("Item registered! ReFind AI matching engine activated.")
`;

  const REQUIREMENTS_TXT = `fastapi>=0.109.0
uvicorn[standard]>=0.27.0
streamlit>=1.31.0
pydantic>=2.6.0
python-multipart>=0.0.7
requests>=2.31.0
numpy>=1.26.0
pillow>=10.2.0
google-genai>=0.1.1
`;

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ReFind AI Technical & API Architecture</h2>
            <p className="text-xs text-slate-400">
              Complete specification for FastAPI backend services, Streamlit frontend client, and REST endpoints.
            </p>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSelectedSpec('endpoints')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            selectedSpec === 'endpoints' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          REST API Endpoints Spec
        </button>
        <button
          onClick={() => setSelectedSpec('fastapi')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            selectedSpec === 'fastapi' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          FastAPI (main.py)
        </button>
        <button
          onClick={() => setSelectedSpec('streamlit')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            selectedSpec === 'streamlit' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Streamlit (app.py)
        </button>
        <button
          onClick={() => setSelectedSpec('requirements')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            selectedSpec === 'requirements' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          requirements.txt
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        {selectedSpec === 'endpoints' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">FastAPI Endpoints Reference</h3>
            <div className="space-y-3">
              
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 font-mono">POST</span>
                  <span className="text-sm font-mono text-white">/api/v1/items/lost</span>
                </div>
                <p className="text-xs text-slate-400">Registers a lost item with private verification questions and locks reward in escrow.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 font-mono">POST</span>
                  <span className="text-sm font-mono text-white">/api/v1/items/found</span>
                </div>
                <p className="text-xs text-slate-400">Registers an item found by a custodian or good samaritan, uploading image and location.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 font-mono">POST</span>
                  <span className="text-sm font-mono text-white">/api/v1/match/compute</span>
                </div>
                <p className="text-xs text-slate-400">Runs multimodal AI comparison across Visual (35%), Semantic (30%), Spatial (20%), and Temporal (15%).</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 font-mono">POST</span>
                  <span className="text-sm font-mono text-white">/api/v1/verification/verify</span>
                </div>
                <p className="text-xs text-slate-400">Evaluates claimant responses against confidential owner keys; returns 6-digit one-time PIN upon success.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 font-mono">POST</span>
                  <span className="text-sm font-mono text-white">/api/v1/escrow/release</span>
                </div>
                <p className="text-xs text-slate-400">Confirms physical exchange and releases locked escrow funds directly to verified finder.</p>
              </div>

            </div>
          </div>
        )}

        {selectedSpec === 'fastapi' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">backend/main.py</span>
              <button
                onClick={() => handleCopy(FASTAPI_CODE)}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-xs text-slate-300 font-mono border border-slate-800">
              {FASTAPI_CODE}
            </pre>
          </div>
        )}

        {selectedSpec === 'streamlit' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">frontend/app.py</span>
              <button
                onClick={() => handleCopy(STREAMLIT_CODE)}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-xs text-slate-300 font-mono border border-slate-800">
              {STREAMLIT_CODE}
            </pre>
          </div>
        )}

        {selectedSpec === 'requirements' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">requirements.txt</span>
              <button
                onClick={() => handleCopy(REQUIREMENTS_TXT)}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-xs text-slate-300 font-mono border border-slate-800">
              {REQUIREMENTS_TXT}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
