import {
  calculatorSearchIndex, calculatorSearchScore, directoryCopy, directoryLocation,
  directoryText, directoryTracks, normalizeDirectorySearch, validateDirectory,
} from "./calculator-directory.js";

export function mountCalculatorDirectory({keys, labels, fields, getLanguage, openCalculator}) {
  validateDirectory(keys);
  const search = document.querySelector("#search");
  const filters = document.querySelector("#categories");
  const nav = document.querySelector("#nav");
  const options = document.querySelector("#subcategory");
  const subcategoryControl = document.querySelector("#subcategory-control");
  const clear = document.querySelector("#clear-search");
  const count = document.querySelector("#directory-count");
  const heading = document.querySelector("#welcome-copy");
  let activeTrack = "";
  let activeGroup = "";
  let indexedLanguage;
  let index;

  const node = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  };

  const card = ({key, title, description}, language, showTrack) => {
    const {track, group} = directoryLocation(key);
    const button = node("button","tool-card");
    button.type = "button";
    button.dataset.toolKey = key;
    button.dataset.track = track.id;
    button.dataset.subcategory = group.id;
    button.setAttribute("aria-label", title);
    const icon = node("span","tool-icon",track.icon);
    icon.setAttribute("aria-hidden","true");
    const groupName = directoryText(group.label,language);
    const badge = showTrack ? directoryText(track.label,language)+" · "+groupName : groupName;
    button.append(icon,node("strong","tool-card-title",title),
      node("span","tool-card-description",description),node("span","tool-card-category",badge));
    button.addEventListener("click",()=>openCalculator(key));
    return button;
  };

  function renderFilters(language) {
    const selected = directoryTracks.find(track=>track.id===activeTrack);
    const choices = [{id:"",label:directoryCopy.allTracks},...directoryTracks];
    filters.replaceChildren(...choices.map(({id,label})=>{
      const button = node("button","category-chip",directoryText(label,language));
      button.type = "button";
      button.dataset.trackFilter = id || "all";
      button.setAttribute("aria-pressed",String(id===activeTrack));
      button.addEventListener("click",()=>{
        activeTrack = id;
        activeGroup = "";
        render();
        filters.querySelector('[aria-pressed="true"]')?.focus();
      });
      return button;
    }));
    subcategoryControl.hidden = !selected;
    document.querySelector("#subcategory-label").textContent = directoryText(directoryCopy.subcategories,language);
    const subcategories = [{id:"",label:directoryCopy.allSubcategories},...(selected?.groups||[])];
    options.replaceChildren(...subcategories.map(({id,label})=>{
      const option = node("option","",directoryText(label,language));
      option.value = id;
      return option;
    }));
    options.value = activeGroup;
  }

  function render() {
    const language = getLanguage();
    if (indexedLanguage !== language) {
      index = new Map(keys.map((key,position)=>{
        const entry = labels(position,language);
        return [key,{key,...entry,search:calculatorSearchIndex({key,...entry,fields:fields(key,language)})}];
      }));
      heading.textContent = directoryText(directoryCopy.searchHelp,language);
      clear.textContent = directoryText(directoryCopy.clear,language);
      indexedLanguage = language;
    }
    renderFilters(language);
    clear.hidden = search.value.length === 0;
    const query = normalizeDirectorySearch(search.value);
    const matches = [...index.values()].filter(({key})=>{
      const {track, group} = directoryLocation(key);
      return (!activeTrack||track.id===activeTrack)&&(!activeGroup||group.id===activeGroup);
    }).map(entry=>({entry,score:calculatorSearchScore(entry.search,query)})).filter(({score})=>score>=0);
    count.textContent = directoryText(directoryCopy.resultCount,language)
      .replace("{count}",String(matches.length)).replace("{total}",String(keys.length));

    if (!matches.length) {
      nav.replaceChildren(node("p","muted",directoryText(directoryCopy.noResults,language)));
      return;
    }
    if (query) {
      const grid = node("div","tool-grid");
      matches.sort((a,b)=>b.score-a.score);
      grid.replaceChildren(...matches.map(({entry})=>card(entry,language,!activeTrack)));
      nav.replaceChildren(grid);
      return;
    }
    const visible = new Set(matches.map(({entry})=>entry.key));
    const sections = [];
    for (const track of directoryTracks) {
      const section = node("section","directory-track");
      section.dataset.directoryTrack = track.id;
      const title = node("h3","directory-track-heading",directoryText(track.label,language));
      const titleId = "directory-track-"+track.id;
      title.id = titleId;
      section.setAttribute("aria-labelledby",titleId);
      section.append(title);
      for (const group of track.groups) {
        const entries = group.keys.filter(key=>visible.has(key));
        if (!entries.length) continue;
        const subheading = node("h4","directory-subheading",directoryText(group.label,language));
        const grid = node("div","tool-grid");
        grid.dataset.directoryGroup = group.id;
        grid.replaceChildren(...entries.map(key=>card(index.get(key),language,false)));
        section.append(subheading,grid);
      }
      if (section.children.length > 1) sections.push(section);
    }
    nav.replaceChildren(...sections);
  }

  search.addEventListener("input",render);
  options.addEventListener("change",()=>{
    activeGroup = options.value;
    render();
  });
  clear.addEventListener("click",()=>{
    search.value = "";
    render();
    search.focus();
  });
  return render;
}
