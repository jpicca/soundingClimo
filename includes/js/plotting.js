var margin = {top: 40, right: 25, bottom: 50, left: 90};

class tsChart {

  // Create instance with variables
  constructor(width) {
    this.width = width - margin.left - margin.right;
    this.title = "";
    this.ylabel = "";
  }

  // Set title of chart
  setTitle(title) {
    this.title = title;
    return this;
  }

  setYLabel(ylabel) {
    this.ylabel = ylabel;
    return this;
  }

}