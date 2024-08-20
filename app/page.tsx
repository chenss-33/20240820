"use client";
import "./page.css";
import React, { useEffect, useState } from "react";
import {
  CloudUploadOutlined,
  SyncOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import { PDFDocument, degrees } from "pdf-lib";
import { Button, Spin, Tooltip, Upload } from "antd";
import type { UploadProps } from "antd";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const list = [
    {
      id: 1,
      url: "",
      title: "Pricing",
    },
    {
      id: 2,
      url: "",
      title: "Chrome extension",
    },
    {
      id: 3,
      url: "",
      title: "Use cases",
    },
    {
      id: 4,
      url: "",
      title: "Get started →",
    },
  ];
  const [file, setFile] = useState<any>(null);
  const [numPages, setNumPages] = useState(null);
  // 判断读取文件是否成功
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  // 给图片加上旋转
  const [rotations, setRotations] = useState<any>({});

  const rotatePage = (number: number) => {
    // 更新指定页面的旋转角度
    setRotations((prevRotations: any) => ({
      ...prevRotations,
      [number]: (prevRotations[number] + 90) % 360,
    }));
  };

  // 旋转所有页面
  const rotateAll = () => {
    const updatedRotations = Object.keys(rotations).reduce((acc: any, key) => {
      acc[key] = (rotations[key] + 90) % 360; // 加 90 度，并保证在 0-360 度之间
      return acc;
    }, {});
    setRotations(updatedRotations);
  };

  const onDocumentLoadSuccess = (numPages: any) => {
    setSuccess(true);
    setLoading(false);
    setNumPages(numPages._pdfInfo.numPages);
    // 初始化每个页面的旋转角度为 0
    const initialRotations = [];
    for (let i = 1; i <= numPages; i++) {
      initialRotations[i] = 0;
    }
    setRotations(initialRotations);
  };

  const props: UploadProps = {
    name: "file",
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    headers: {
      authorization: "authorization-text",
    },
    beforeUpload(info) {
      setLoading(true);
      setFile(info);
    },
  };

  // 移除文件
  const removeFile = () => {
    setSuccess(false);
    setLoading(false);
    setFile(null);
  };

  const [scale, setScale] = useState(1.0); // 初始缩放比例
  const [disabledMax, setDisabledMax] = useState(false);
  const [disabledMin, setDisabledMin] = useState(false);

  useEffect(() => {
    if (Number(scale.toFixed(2)) <= 0.4) {
      setDisabledMin(true);
    } else if (Number(scale.toFixed(2)) >= 3) {
      setDisabledMax(true);
    } else {
      setDisabledMin(false);
      setDisabledMax(false);
    }
  }, [scale]);
  // 放大
  const addScale = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0)); // 放大
  };

  // 缩小
  const reduceScale = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.4)); // 缩小，最小缩放比例限制为0.2
  };

  // 下载pdf文件
  const downloadPDF = async () => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // 旋转每一页
    pdfDoc.getPages().forEach((page, index) => {
      const rotation = rotations[index + 1] || 0;
      page.setRotation(degrees(rotation));
    });

    // 导出处理后的 PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rotated-file.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  return (
    <main className="flex min-h-screen flex-col page-main">
      <section className="header">
        <div className="left">
          {/* <img src="" alt="" /> */}
          <div>PDF.ai</div>
        </div>
        <div className="right">
          <ul>
            {list.map((item, index) => (
              <li
                className={activeIndex === index ? "active" : ""}
                key={item.id}
                onMouseEnter={() => {
                  setActiveIndex(index);
                }}
                onMouseLeave={() => {
                  setActiveIndex(-1);
                }}
              >
                <a href={item.url}>{item.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="middle">
        <div className="title">Rotate PDF Pages</div>
        <p className="desc">
          Simply click on a page to rotate it. You can then download your
          modified PDF.
        </p>
        {loading && !success && <Spin spinning={loading}></Spin>}
        {!loading && !success && (
          <div className="upload-empty">
            <div className="center">
              <Upload
                {...props}
                accept="application/pdf"
                showUploadList={false}
              >
                <CloudUploadOutlined />
              </Upload>

              <p className="click-content">Click to upload or drag and drop</p>
            </div>
          </div>
        )}

        <div>
          {file && (
            <div>
              {success && (
                <div className="button-box">
                  <Button className="btn1" onClick={rotateAll}>
                    Rotate all
                  </Button>
                  <Button className="btn2" onClick={removeFile}>
                    Remove PDF
                  </Button>
                  <Tooltip title="Zoom in">
                    <Button
                      icon={<ZoomInOutlined />}
                      className="scale-add"
                      onClick={addScale}
                      disabled={disabledMax}
                    ></Button>
                  </Tooltip>

                  <Tooltip title="Zoom out">
                    <Button
                      icon={<ZoomOutOutlined />}
                      className="scale-reduce"
                      onClick={reduceScale}
                      disabled={disabledMin}
                    ></Button>
                  </Tooltip>
                </div>
              )}

              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => {
                  setSuccess(false);
                  console.error("Failed to load document", err);
                }}
                onSourceSuccess={() => {
                  console.log("Source success");
                }}
                onSourceError={(error) => {
                  console.error("Source error", error);
                }}
                className="doument"
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    className="main-page"
                    onClick={() => rotatePage(index + 1)}
                    key={index}
                  >
                    <Page
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      width={200}
                      scale={scale}
                      rotate={rotations[index + 1]} // 使用对应页面的旋转角度
                    />
                    <div className="refresh">
                      <SyncOutlined />
                    </div>
                    <div className="number-page">{index + 1}</div>
                  </div>
                ))}
              </Document>
              {success && (
                <div className="download">
                  <Button className="" onClick={downloadPDF}>
                    Download
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <section className="bottom">
        <div className="content">
          <div className="section1 box">
            {/* <img src="" alt="" /> */}
            <p className="desc">
              Chat with any PDF: ask questions, get summaries, find information,
              and more.
            </p>
          </div>
          <div className="section1">
            <div className="tite">Products</div>
            <p className="desc">Use cases</p>
            <p className="desc">Chrome extension</p>
            <p className="desc">API docs</p>
            <p className="desc">Pricing</p>
            <p className="desc">Video tutorials</p>
            <p className="desc">Resources</p>
            <p className="desc">Blog</p>
            <p className="desc">FAQ</p>
          </div>
          <div className="section1">
            <div className="tite">We also built</div>
            <p className="desc">Resume AI Scanner</p>
            <p className="desc">Invoice AI Scanner</p>
            <p className="desc">AI Quiz Generator</p>
            <p className="desc">QuickyAI</p>
            <p className="desc">Docsium</p>
            <p className="desc">PDF GPTs</p>
            <p className="desc">PDF AI generator</p>
            <p className="desc">Other PDF tools</p>
          </div>
          <div className="section1">
            <div className="tite">Company</div>
            <p className="desc">PDF.ai vs ChatPDF</p>
            <p className="desc">PDF.ai vs Acrobat Reader</p>
            <p className="desc">ALegal</p>
            <p className="desc">Affiliate program 💵</p>
            <p className="desc">Investor</p>
          </div>
        </div>
      </section>
    </main>
  );
}
